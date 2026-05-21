package com.equisoft.leavemanagement.repository;

import com.equisoft.leavemanagement.model.LeaveRequest;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    @EntityGraph(attributePaths = {"employee", "decidedBy"})
    List<LeaveRequest> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);

    @EntityGraph(attributePaths = {"employee", "decidedBy"})
    List<LeaveRequest> findAllByOrderByCreatedAtDesc();
}
