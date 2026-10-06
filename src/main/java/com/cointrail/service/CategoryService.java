package com.cointrail.service;

import com.cointrail.dto.CategoryDto;
import com.cointrail.model.Category;
import com.cointrail.model.User;
import com.cointrail.repository.CategoryRepository;
import com.cointrail.repository.ExpenseEntryRepository;
import com.cointrail.repository.UserRepository;
import com.cointrail.security.SecurityUtils;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@Service
@Transactional
public class CategoryService {

    private static final Logger log = LoggerFactory.getLogger(CategoryService.class);

    private final CategoryRepository categoryRepository;
    private final ExpenseEntryRepository expenseEntryRepository;
    private final SecurityUtils securityUtils;
    private final ColorPaletteService colorPaletteService;
    private final UserRepository userRepository;

    public CategoryService(CategoryRepository categoryRepository,
                           ExpenseEntryRepository expenseEntryRepository,
                           SecurityUtils securityUtils,
                           ColorPaletteService colorPaletteService,
                           UserRepository userRepository) {
        this.categoryRepository = categoryRepository;
        this.expenseEntryRepository = expenseEntryRepository;
        this.securityUtils = securityUtils;
        this.colorPaletteService = colorPaletteService;
        this.userRepository = userRepository;
    }

    @PostConstruct
    public void initCategories() {
        seedDefaultCategories();
        deduplicateCategoryColors();
    }

    public void seedDefaultCategories() {
        if (categoryRepository.count() == 0) {
            List<Category> defaults = Arrays.asList(
                    new Category("Food & Dining", "#10B981", "Utensils", true),
                    new Category("Shopping", "#EC4899", "ShoppingBag", true),
                    new Category("Transportation", "#3B82F6", "Car", true),
                    new Category("Bills & Utilities", "#F59E0B", "Zap", true),
                    new Category("Entertainment", "#8B5CF6", "Film", true),
                    new Category("Health & Fitness", "#EF4444", "HeartPulse", true),
                    new Category("Travel", "#06B6D4", "Plane", true),
                    new Category("Education", "#6366F1", "GraduationCap", true),
                    new Category("Other", "#6B7280", "MoreHorizontal", true)
            );
            categoryRepository.saveAll(defaults);
        }
    }

    /**
     * Deduplicates existing categories across the database user-wise,
     * ensuring no user has two categories with the exact same color.
     */
    public void deduplicateCategoryColors() {
        int updatedCount = 0;
        // 1. Ensure default system categories have distinct unique colors from arsenal
        List<Category> defaults = categoryRepository.findByUserIsNull();
        Set<String> defaultColors = new HashSet<>();
        for (Category def : defaults) {
            String color = def.getColor();
            if (color == null || color.isBlank() || defaultColors.contains(color.toUpperCase())) {
                String newColor = colorPaletteService.assignUniqueColor(defaultColors);
                def.setColor(newColor);
                categoryRepository.save(def);
                defaultColors.add(newColor.toUpperCase());
                updatedCount++;
            } else {
                defaultColors.add(color.toUpperCase());
            }
        }

        // 2. For each user, ensure their custom categories don't duplicate any color
        List<User> users = userRepository.findAll();
        for (User user : users) {
            Set<String> userColors = new HashSet<>(defaultColors);
            List<Category> userCategories = categoryRepository.findByUser(user);
            for (Category cat : userCategories) {
                String color = cat.getColor();
                if (color == null || color.isBlank() || userColors.contains(color.toUpperCase())) {
                    String newColor = colorPaletteService.assignUniqueColor(userColors);
                    cat.setColor(newColor);
                    categoryRepository.save(cat);
                    userColors.add(newColor.toUpperCase());
                    updatedCount++;
                } else {
                    userColors.add(color.toUpperCase());
                }
            }
        }
        log.info("Deduplication check completed. Total category colors reassigned: {}", updatedCount);
    }

    @Transactional(readOnly = true)
    public List<Category> getAllCategories() {
        User user = securityUtils.getCurrentUser();
        if (user != null) {
            return categoryRepository.findAvailableForUser(user);
        }
        return categoryRepository.findAllByOrderByNameAsc();
    }

    @Transactional(readOnly = true)
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found with id: " + id));
    }

    public Category createCategory(CategoryDto dto) {
        User user = securityUtils.getCurrentUser();
        String name = dto.getName().trim();

        if (user != null && categoryRepository.existsByNameForUser(name, user)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A category with name '" + name + "' already exists");
        }

        // Collect existing colors used by this user (including system default categories)
        List<Category> available = user != null ? categoryRepository.findAvailableForUser(user) : categoryRepository.findAll();
        Set<String> usedColors = new HashSet<>();
        for (Category existing : available) {
            if (existing.getColor() != null && !existing.getColor().isBlank()) {
                usedColors.add(existing.getColor());
            }
        }

        // System assigns unique color from 1,000+ color arsenal (user cannot pick color)
        String assignedColor = colorPaletteService.assignUniqueColor(usedColors);

        Category category = new Category();
        category.setName(name);
        category.setColor(assignedColor);
        category.setIcon(dto.getIcon() != null && !dto.getIcon().isBlank() ? dto.getIcon() : "Tag");
        category.setDefault(false);
        category.setUser(user);
        return categoryRepository.save(category);
    }

    public Category updateCategory(Long id, CategoryDto dto) {
        Category category = getCategoryById(id);
        User user = securityUtils.getCurrentUser();

        if (category.isDefault() || (category.getUser() != null && user != null && !category.getUser().getId().equals(user.getId()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot modify system default or other users' categories");
        }

        String name = dto.getName().trim();
        if (user != null && categoryRepository.existsByNameAndIdNotForUser(name, id, user)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Another category with name '" + name + "' already exists");
        }

        category.setName(name);

        // User cannot change system-assigned color. Preserve assigned color (or assign unique if missing)
        if (category.getColor() == null || category.getColor().isBlank()) {
            List<Category> available = user != null ? categoryRepository.findAvailableForUser(user) : categoryRepository.findAll();
            Set<String> usedColors = new HashSet<>();
            for (Category existing : available) {
                if (!existing.getId().equals(id) && existing.getColor() != null) {
                    usedColors.add(existing.getColor());
                }
            }
            category.setColor(colorPaletteService.assignUniqueColor(usedColors));
        }

        if (dto.getIcon() != null && !dto.getIcon().isBlank()) {
            category.setIcon(dto.getIcon());
        }
        return categoryRepository.save(category);
    }

    public void deleteCategory(Long id) {
        Category category = getCategoryById(id);
        User user = securityUtils.getCurrentUser();

        if (category.isDefault() || (category.getUser() != null && user != null && !category.getUser().getId().equals(user.getId()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot delete system default or other users' categories");
        }

        if (expenseEntryRepository.existsByCategoryId(id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot delete category '" + category.getName() + "' because transactions are linked to it. Please reassign or delete linked transactions first.");
        }
        categoryRepository.delete(category);
    }
}
