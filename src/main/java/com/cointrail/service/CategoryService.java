package com.cointrail.service;

import com.cointrail.dto.CategoryDto;
import com.cointrail.model.Category;
import com.cointrail.model.User;
import com.cointrail.repository.CategoryRepository;
import com.cointrail.repository.ExpenseEntryRepository;
import com.cointrail.security.SecurityUtils;
import jakarta.annotation.PostConstruct;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.List;

@Service
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ExpenseEntryRepository expenseEntryRepository;
    private final SecurityUtils securityUtils;

    public CategoryService(CategoryRepository categoryRepository,
                           ExpenseEntryRepository expenseEntryRepository,
                           SecurityUtils securityUtils) {
        this.categoryRepository = categoryRepository;
        this.expenseEntryRepository = expenseEntryRepository;
        this.securityUtils = securityUtils;
    }

    @PostConstruct
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

        Category category = new Category();
        category.setName(name);
        category.setColor(dto.getColor() != null && !dto.getColor().isBlank() ? dto.getColor() : "#6B7280");
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
        if (dto.getColor() != null && !dto.getColor().isBlank()) {
            category.setColor(dto.getColor());
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
