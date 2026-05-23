package com.placeguess.repository;

import com.placeguess.entity.Game;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GameRepository extends JpaRepository<Game, Long> {

    List<Game> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Game> findByIdAndUserId(Long gameId, Long userId);

    @Query("SELECT g FROM Game g WHERE g.user.id = :userId AND g.status = 'IN_PROGRESS'")
    List<Game> findActiveGamesByUserId(Long userId);

    @Query("SELECT g FROM Game g WHERE g.status = 'COMPLETED' ORDER BY g.totalScore DESC")
    List<Game> findTopGamesByScore(Pageable pageable);
}
