<template>
  <div class="home">
    <a-divider orientation="left">Schedule a Meeting</a-divider>
    <a-date-picker @change="onDateChange" />
    <a-divider type="vertical" />
    <a-time-picker
      use12Hours
      :hourStep="1"
      :minuteStep="10"
      format="h:mm a"
      @change="onTimeChange"
    />
    <a-divider type="vertical" />
    <a-select placeholder="Duration" style="width: 120px" @change="onSelectChange">
      <a-select-option value="30">30 Minutes</a-select-option>
      <a-select-option value="60">60 Minutes</a-select-option>
    </a-select>
    <a-divider type="vertical" />
    <a-button icon="check" shape="circle" @click="onSubmit"></a-button>
  </div>
</template>

<script>
/* eslint-disable no-console */
import axios from "axios";
export default {
  name: "home",
  data() {
    return {
      date: null,
      time: null,
      duration: null
    };
  },
  methods: {
    onDateChange(date, dateString) {
      console.log(date, dateString);
      this.date = date;
    },
    onTimeChange(time, timeString) {
      console.log(time, timeString);
      this.time = time;
    },
    onSelectChange(value) {
      this.duration = parseInt(value);
    },
    onSubmit() {
      if (!this.date) {
        this.$message.warn("Please select date");
        return;
      }
      if (!this.time) {
        this.$message.warn("Please select time");
        return;
      }
      if (!this.duration) {
        this.$message.warn("Please select duration");
        return;
      }
      this.date.hour(this.time.get("hour"));
      this.date.minute(this.time.get("minute"));
      this.date.second(0);
      const args = {
        startTime: this.date.format(),
        duration: this.duration
      };
      this.addEvent(args);
    },
    async addEvent(data) {
      try {
        const response = await axios.post("http://localhost:3000/events", data);
        console.log(response.data);
        this.$message.success("Meeting scheduled successfully");
      } catch (error) {
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          this.$message.error(error.response.data.message);
        } else {
          this.$message.error("Something went wrong!");
        }
      }
    }
  }
};
</script>
