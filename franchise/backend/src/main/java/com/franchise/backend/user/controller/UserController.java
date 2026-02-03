package com.franchise.backend.user.controller;

import com.franchise.backend.common.response.ApiResponse;
import com.franchise.backend.user.dto.SupervisorOptionResponse;
import com.franchise.backend.user.entity.Role;
import com.franchise.backend.user.entity.User;
import com.franchise.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/supervisors")
    public ApiResponse<List<SupervisorOptionResponse>> supervisors(
            @RequestParam String region
    ) {
        List<User> users = userRepository.findByRoleAndRegionOrderByUserNameAsc(Role.SUPERVISOR, region);

        List<SupervisorOptionResponse> result = users.stream()
                .map(u -> new SupervisorOptionResponse(
                        u.getLoginId(),
                        u.getUserName(),
                        u.getDepartment(), // 소속팀
                        u.getRegion()
                ))
                .toList();

        return ApiResponse.ok(result);
        //w
    }
}
