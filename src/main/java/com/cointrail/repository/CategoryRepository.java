package com.cointrail.repository;

import com.cointrail.model.Category;
import com.cointrail.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    @Query("SELECT c FROM Category c WHERE c.user IS NULL OR c.user = :user ORDER BY c.name ASC")
    List<Category> findAvailableForUser(@Param("user") User user);

    @Query("SELECT COUNT(c) > 0 FROM Category c WHERE LOWER(c.name) = LOWER(:name) AND (c.user IS NULL OR c.user = :user)")
    boolean existsByNameForUser(@Param("name") String name, @Param("user") User user);

    @Query("SELECT COUNT(c) > 0 FROM Category c WHERE LOWER(c.name) = LOWER(:name) AND c.id != :id AND (c.user IS NULL OR c.user = :user)")
    boolean existsByNameAndIdNotForUser(@Param("name") String name, @Param("id") Long id, @Param("user") User user);

    Optional<Category> findByIdAndUser(Long id, User user);

    Optional<Category> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

    List<Category> findByUser(User user);

    List<Category> findByUserIsNull();

    List<Category> findAllByOrderByNameAsc();
}
