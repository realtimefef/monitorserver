package com.monitorserver.dto.response;

import com.monitorserver.entity.UserNotificationPreference;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreferenceResponse {

    private Boolean emailEnabled;

    private Boolean emailCritical;

    private Boolean emailWarning;

    private Boolean quietHoursEnabled;

    private Integer quietHoursStart;

    private Integer quietHoursEnd;

    public static NotificationPreferenceResponse from(UserNotificationPreference pref) {
        return NotificationPreferenceResponse.builder()
                .emailEnabled(pref.isEmailEnabled())
                .emailCritical(pref.isEmailCritical())
                .emailWarning(pref.isEmailWarning())
                .quietHoursEnabled(pref.isQuietHoursEnabled())
                .quietHoursStart(pref.getQuietHoursStart())
                .quietHoursEnd(pref.getQuietHoursEnd())
                .build();
    }
}
