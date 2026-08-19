package org.devflow.user;

import org.hibernate.boot.internal.Abstract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<Long, User> {

    User findByEmail(String email);
    boolean existsByEmail(String email);
}
