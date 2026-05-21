package com.equisoft.leavemanagement.controller;

import com.equisoft.leavemanagement.dto.LeaveDtos.CreateLeaveRequest;
import com.equisoft.leavemanagement.dto.LeaveDtos.DecisionRequest;
import com.equisoft.leavemanagement.dto.LeaveDtos.LeaveResponse;
import com.equisoft.leavemanagement.service.LeaveService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE','ADMIN')")
    public LeaveResponse create(@Valid @RequestBody CreateLeaveRequest req, Authentication auth) {
        return leaveService.create(auth.getName(), req);
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('EMPLOYEE','ADMIN')")
    public List<LeaveResponse> myHistory(Authentication auth) {
        return leaveService.myHistory(auth.getName());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<LeaveResponse> all() {
        return leaveService.all();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYEE','ADMIN')")
    public LeaveResponse update(@PathVariable Long id,
                                @Valid @RequestBody CreateLeaveRequest req,
                                Authentication auth) {
        return leaveService.update(id, auth.getName(), req);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYEE','ADMIN')")
    public void delete(@PathVariable Long id, Authentication auth) {
        leaveService.delete(id, auth.getName());
    }

    @PatchMapping("/{id}/decision")
    @PreAuthorize("hasRole('ADMIN')")
    public LeaveResponse decide(@PathVariable Long id,
                                @Valid @RequestBody DecisionRequest req,
                                Authentication auth) {
        return leaveService.decide(id, req.status(), auth.getName());
    }
}
