package com.placeguess.repository;

import com.placeguess.entity.Round;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoundRepository extends JpaRepository<Round, Long> {

    List<Round> findByGameIdOrderByRoundNumber(Long gameId);

    Optional<Round> findByGameIdAndRoundNumber(Long gameId, Integer roundNumber);

    long countByGameId(Long gameId);

    long countByGameIdAndAnsweredAtIsNotNull(Long gameId);

    Optional<Round> findFirstByGameIdAndAnsweredAtIsNullOrderByRoundNumber(Long gameId);
}
