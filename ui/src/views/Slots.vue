<template>
  <div class="available-slots">
    <a-date-picker @change="onChange" :defaultValue="selectedDate" />
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
import axios from "axios";
import moment from "moment";
export default {
  name: "available-slots",
  data() {
    return {
      selectedDate: moment(),
      selectedSlotIndex: null,
      slots: []
    };
  },
  mounted() {
    this.getAvailability();
  },
  methods: {
    confirmMeeting(index, slot) {
      this.selectedSlotIndex = index;
      this.addEvent(slot);
    },
    onChange(date, dateString) {
      console.log(date, dateString);
      this.selectedDate = date;
      this.getAvailability();
    },
    getAvailability() {
      this.slots = [];
      const date = this.selectedDate.format("YYYY-MM-DD");

      axios.get("http://localhost:3000/events/availability?date=" + date).then(
        response => {
          let { data } = response.data;
          data = data.map(row => {
            row.text = moment(row[0]).format("h:mma");
            return row;
          });
          this.slots = data;
        },
        function(error) {
          console.log("error:", error.stack);
        }
      );
    },
    async addEvent(slot) {
      try {
        const response = await axios.post("http://localhost:3000/events", {
          startTime: slot[0],
          duration: moment(slot[1]).diff(moment(slot[0]), "minutes")
        });
        if (response && response.status === 200) {
          this.$message.success("Meeting scheduled successfully");
          this.removeSlot();
        }
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
