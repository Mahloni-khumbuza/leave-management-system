package com.equisoft.leavemanagement.service;

import com.equisoft.leavemanagement.dto.LeaveDtos.CreateLeaveRequest;
import com.equisoft.leavemanagement.dto.LeaveDtos.LeaveResponse;
import com.equisoft.leavemanagement.model.LeaveRequest;
import com.equisoft.leavemanagement.model.LeaveStatus;
import com.equisoft.leavemanagement.model.User;
import com.equisoft.leavemanagement.repository.LeaveRequestRepository;
import com.equisoft.leavemanagement.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@Transactional
public class LeaveService {

    private static final Logger log = LoggerFactory.getLogger(LeaveService.class);

    private final LeaveRequestRepository leaveRepo;
    private final UserRepository userRepo;

    public LeaveService(LeaveRequestRepository leaveRepo, UserRepository userRepo) {
        this.leaveRepo = leaveRepo;
        this.userRepo = userRepo;
    }

    public LeaveResponse create(String employeeEmail, CreateLeaveRequest req) {
        try {
            if (req.endDate().isBefore(req.startDate())) {
                throw new IllegalArgumentException("endDate must be on/after startDate");
            }
            User employee = userRepo.findByEmail(employeeEmail)
                    .orElseThrow(() -> new SecurityException("Authenticated user not found"));
            LeaveRequest entity = LeaveRequest.builder()
                    .employee(employee)
                    .startDate(req.startDate())
                    .endDate(req.endDate())
                    .reason(req.reason())
                    .documentUrl(req.documentUrl())
                    .status(LeaveStatus.PENDING)
                    .build();
            return LeaveResponse.from(leaveRepo.save(entity));
        } catch (ResponseStatusException e) {
            throw e;
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        } catch (SecurityException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unexpected error creating leave for {}", employeeEmail, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to create leave request", e);
        }
    }

    @Transactional(readOnly = true)
    public List<LeaveResponse> myHistory(String employeeEmail) {
        try {
            User employee = userRepo.findByEmail(employeeEmail)
                    .orElseThrow(() -> new SecurityException("Authenticated user not found"));
            return leaveRepo.findByEmployeeIdOrderByCreatedAtDesc(employee.getId())
                    .stream().map(LeaveResponse::from).toList();
        } catch (ResponseStatusException e) {
            throw e;
        } catch (SecurityException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unexpected error loading history for {}", employeeEmail, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to load leave history", e);
        }
    }

    @Transactional(readOnly = true)
    public List<LeaveResponse> all() {
        try {
            return leaveRepo.findAllByOrderByCreatedAtDesc()
                    .stream().map(LeaveResponse::from).toList();
        } catch (Exception e) {
            log.error("Unexpected error loading all leaves", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to load leave requests", e);
        }
    }

    public LeaveResponse update(Long leaveId, String employeeEmail, CreateLeaveRequest req) {
        try {
            if (req.endDate().isBefore(req.startDate())) {
                throw new IllegalArgumentException("endDate must be on/after startDate");
            }
            LeaveRequest leave = leaveRepo.findById(leaveId)
                    .orElseThrow(() -> new NoSuchElementException("Leave request not found"));
            if (!leave.getEmployee().getEmail().equalsIgnoreCase(employeeEmail)) {
                throw new SecurityException("You can only edit your own requests");
            }
            if (leave.getStatus() != LeaveStatus.PENDING) {
                throw new IllegalStateException("Only pending requests can be edited");
            }
            leave.setStartDate(req.startDate());
            leave.setEndDate(req.endDate());
            leave.setReason(req.reason());
            leave.setDocumentUrl(req.documentUrl());
            return LeaveResponse.from(leaveRepo.save(leave));
        } catch (ResponseStatusException e) {
            throw e;
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        } catch (NoSuchElementException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        } catch (SecurityException e) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, e.getMessage(), e);
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unexpected error updating leave {} for {}", leaveId, employeeEmail, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to update leave request", e);
        }
    }

    public void delete(Long leaveId, String employeeEmail) {
        try {
            LeaveRequest leave = leaveRepo.findById(leaveId)
                    .orElseThrow(() -> new NoSuchElementException("Leave request not found"));
            if (!leave.getEmployee().getEmail().equalsIgnoreCase(employeeEmail)) {
                throw new SecurityException("You can only cancel your own requests");
            }
            if (leave.getStatus() != LeaveStatus.PENDING) {
                throw new IllegalStateException("Only pending requests can be cancelled");
            }
            leaveRepo.delete(leave);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (NoSuchElementException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        } catch (SecurityException e) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, e.getMessage(), e);
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unexpected error deleting leave {} for {}", leaveId, employeeEmail, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to cancel leave request", e);
        }
    }

    public LeaveResponse decide(Long leaveId, LeaveStatus newStatus, String adminEmail) {
        try {
            if (newStatus != LeaveStatus.APPROVED && newStatus != LeaveStatus.REJECTED) {
                throw new IllegalArgumentException("status must be APPROVED or REJECTED");
            }
            LeaveRequest leave = leaveRepo.findById(leaveId)
                    .orElseThrow(() -> new NoSuchElementException("Leave request not found"));
            if (leave.getStatus() != LeaveStatus.PENDING) {
                throw new IllegalStateException("Leave already decided");
            }
            User admin = userRepo.findByEmail(adminEmail)
                    .orElseThrow(() -> new SecurityException("Authenticated user not found"));
            leave.setStatus(newStatus);
            leave.setDecidedBy(admin);
            leave.setDecisionAt(Instant.now());
            return LeaveResponse.from(leaveRepo.save(leave));
        } catch (ResponseStatusException e) {
            throw e;
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
        } catch (NoSuchElementException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
        } catch (SecurityException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, e.getMessage(), e);
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unexpected error deciding leave {} by {}", leaveId, adminEmail, e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to record decision", e);
        }
    }
}
