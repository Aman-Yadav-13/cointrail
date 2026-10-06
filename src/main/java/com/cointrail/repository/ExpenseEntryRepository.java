package com.cointrail.repository;

import com.cointrail.dto.CategorySummaryDto;
import com.cointrail.model.ExpenseEntry;
import com.cointrail.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseEntryRepository extends JpaRepository<ExpenseEntry, Long> {

    List<ExpenseEntry> findByUserAndDateBetweenOrderByDateDescCreatedAtDesc(User user, LocalDate startDate, LocalDate endDate);

    List<ExpenseEntry> findByUserAndDateBetweenAndCategoryIdOrderByDateDescCreatedAtDesc(User user, LocalDate startDate, LocalDate endDate, Long categoryId);

    List<ExpenseEntry> findByUserAndDateBetween(User user, LocalDate startDate, LocalDate endDate);

    org.springframework.data.domain.Page<ExpenseEntry> findByUser(User user, org.springframework.data.domain.Pageable pageable);

    org.springframework.data.domain.Page<ExpenseEntry> findByUserAndCategoryId(User user, Long categoryId, org.springframework.data.domain.Pageable pageable);

    org.springframework.data.domain.Page<ExpenseEntry> findByUserAndDateBetween(User user, LocalDate startDate, LocalDate endDate, org.springframework.data.domain.Pageable pageable);

    org.springframework.data.domain.Page<ExpenseEntry> findByUserAndDateBetweenAndCategoryId(User user, LocalDate startDate, LocalDate endDate, Long categoryId, org.springframework.data.domain.Pageable pageable);

    List<ExpenseEntry> findByUserOrderByDateAsc(User user);

    Optional<ExpenseEntry> findByIdAndUser(Long id, User user);

    boolean existsByCategoryId(Long categoryId);

    @Query("SELECT new com.cointrail.dto.CategorySummaryDto(e.category.id, e.category.name, e.category.color, e.category.icon, SUM(e.amount), COUNT(e)) " +
           "FROM ExpenseEntry e WHERE e.user = :user AND e.date >= :startDate AND e.date <= :endDate " +
           "GROUP BY e.category.id, e.category.name, e.category.color, e.category.icon " +
           "ORDER BY SUM(e.amount) DESC")
    List<CategorySummaryDto> findCategorySummariesBetweenForUser(
            @Param("user") User user,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    // Backward-compatibility queries if needed
    List<ExpenseEntry> findByDateBetweenOrderByDateDescCreatedAtDesc(LocalDate startDate, LocalDate endDate);
    List<ExpenseEntry> findByDateBetween(LocalDate startDate, LocalDate endDate);

    @Query("SELECT new com.cointrail.dto.CategorySummaryDto(e.category.id, e.category.name, e.category.color, e.category.icon, SUM(e.amount), COUNT(e)) " +
           "FROM ExpenseEntry e WHERE e.date >= :startDate AND e.date <= :endDate " +
           "GROUP BY e.category.id, e.category.name, e.category.color, e.category.icon " +
           "ORDER BY SUM(e.amount) DESC")
    List<CategorySummaryDto> findCategorySummariesBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
