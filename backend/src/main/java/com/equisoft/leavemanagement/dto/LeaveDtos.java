package com.equisoft.leavemanagement.dto;

import com.equisoft.leavemanagement.model.LeaveRequest;
import com.equisoft.leavemanagement.model.LeaveStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.time.LocalDate;

public class LeaveDtos {

    public record CreateLeaveRequest(
            @NotNull LocalDate startDate,
            @NotNull LocalDate endDate,
            @NotBlank String reason,
            String documentUrl
    ) {}

    public record DecisionRequest(
            @NotNull LeaveStatus status
    ) {}

    public record LeaveResponse(
            Long id,
            Long employeeId,
            String employeeName,
            LocalDate startDate,
            LocalDate endDate,
            String reason,
            LeaveStatus status,
            String documentUrl,
            Instant createdAt,
            Instant decisionAt,
            String decidedByName
    ) {
        public static LeaveResponse from(LeaveRequest l) {
            return new LeaveResponse(
                    l.getId(),
                    l.getEmployee().getId(),
                    l.getEmployee().getFullName(),
                    l.getStartDate(),
                    l.getEndDate(),
                    l.getReason(),
                    l.getStatus(),
                    l.getDocumentUrl(),
                    l.getCreatedAt(),
                    l.getDecisionAt(),
                    l.getDecidedBy() == null ? null : l.getDecidedBy().getFullName()
            );
        }
    }
}
