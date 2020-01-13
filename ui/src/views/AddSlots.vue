<template>
  <div class="available-slots">
    <a-divider />
    <a-range-picker
      :showTime="{ format: 'HH:mm' }"
      format="YYYY-MM-DD HH:mm"
      :placeholder="['Start Time', 'End Time']"
      @ok="onOk"
    />
    <a-divider type="vertical" />
    <a-select
      placeholder="Duration"
      style="width: 120px"
      @change="onSelectChange"
    >
      <a-select-option value="30">30 Minutes</a-select-option>
      <a-select-option value="60">60 Minutes</a-select-option>
    </a-select>
    <a-divider type="vertical" />
    <a-button icon="check" shape="circle" @click="onSubmit"></a-button>
  </div>
</template>
<script>
/* eslint-disable no-console */
import axios from 'axios';
// import moment from 'moment';
export default {
  name: 'add-slots',
  data() {
    return {
      loading: true,
      start: null,
      end: null,
      duration: null
    };
  },
  methods: {
    onSelectChange(value) {
      this.duration = parseInt(value);
    },
    onOk(args) {
      console.log(args);
      this.start = args[0].format();
      this.end = args[1].format();
      this.createSlots();
    },
    onSubmit() {
      this.createSlots();
    },
    async createSlots() {
      this.loading = true;
      if (!this.start) {
        this.$message.warn('Please select start time');
        return;
      }
      if (!this.end) {
        this.$message.warn('Please select end time');
        return;
      }
      if (!this.duration) {
        this.$message.warn('Please select duration');
        return;
      }

      const data = {
        start: this.start,
        end: this.end,
        duration: 30
      };
      try {
        const response = await axios.post(
          'http://localhost:3000/events/availability',
          data
        );
        console.log(response.data);
        this.$message.success('Slots added successfully');
      } catch (error) {
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          this.$message.error(error.response.data.message);
        } else {
          this.$message.error('Something went wrong!');
        }
      }
    }
  }
};
</script>
<style scoped>
.ant-card {
  cursor: pointer;
}

.ant-card:hover .ant-card-head-title {
  color: #1890ff;
}
</style>
