<template>
  <div class="available-slots">
    <a-date-picker @change="onChange" />
    <a-divider />
    <a-list :grid="{ gutter: 16, column: 4 }" :dataSource="slots">
      <a-list-item slot="renderItem" slot-scope="item, index">
        <a-popconfirm
          title="Confirm?"
          @confirm="confirmMeeting(index, item)"
          okText="Yes"
          cancelText="No"
        >
          <a-card :title="item.text"></a-card>
        </a-popconfirm>
      </a-list-item>
    </a-list>
  </div>
</template>
<script>
/* eslint-disable no-console */
import axios from 'axios';
import moment from 'moment';
export default {
  name: 'available-slots',
  data() {
    return {
      loading: true,
      selectedSlotIndex: null,
      slots: []
    };
  },
  methods: {
    confirmMeeting(index, slot) {
      this.selectedSlotIndex = index;
      this.addEvent(slot);
    },
    onChange(date, dateString) {
      console.log(date, dateString);
      this.getAvailability(dateString);
    },
    getAvailability(date) {
      this.loading = true;
      axios.get('http://localhost:3000/events/availability?date=' + date).then(
        response => {
          this.loading = false;
          let { data } = response.data;
          data = data.map(row => {
            row.text = moment(row.time).format('h:mma');
            return row;
          });
          console.log(data);
          this.slots = data;
        },
        function(error) {
          console.log('error:', error.stack);
          this.loading = false;
        }
      );
    },
    async addEvent(slot) {
      const response = await axios.post('http://localhost:3000/events', {
        startTime: slot.time,
        duration: slot.duration
      });
      if (response && response.status === 200) {
        this.$message.success('Meeting scheduled successfully');
        this.removeSlot();
      } else {
        this.$message.error('Something went wrong!');
      }
    },
    removeSlot() {
      this.slots.splice(this.selectedSlotIndex, 1);
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
