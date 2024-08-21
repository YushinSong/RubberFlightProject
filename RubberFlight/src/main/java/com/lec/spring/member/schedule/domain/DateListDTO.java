package com.lec.spring.member.schedule.domain;

import java.util.List;

public class DateListDTO {
    private Long scheduleId;
    private List<Date> dates;
    private Integer deleteIndex;
    private Long editVersion;

    public Long getEditVersion() {
        return editVersion;
    }

    public void setEditVersion(Long editVersion) {
        this.editVersion = editVersion;
    }

    public Integer getDeleteIndex() {
        return deleteIndex;
    }

    public void setDeleteIndex(Integer deleteIndex) {
        this.deleteIndex = deleteIndex;
    }

    public Long getScheduleId() {
        return scheduleId;
    }

    public void setScheduleId(Long scheduleId) {
        this.scheduleId = scheduleId;
    }

    public List<Date> getDates() {
        return dates;
    }

    public void setDates(List<Date> dates) {
        this.dates = dates;
    }
}
