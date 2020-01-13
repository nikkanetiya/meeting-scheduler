<template>
  <div class="meetings">
    <!-- <a-date-picker @change="onChange" /> -->
    <a-range-picker
      :defaultValue="[startDate, endDate]"
      @calendarChange="onChange"
    />
    <a-divider />
    <a-list :grid="{ gutter: 16, column: 4 }" :dataSource="events">
      <a-list-item slot="renderItem" slot-scope="item">
        <a-card :title="item.date">{{ item.hours }}</a-card>
      </a-list-item>
    </a-list>
  </div>
</template>
<script>
/* eslint-disable no-console */
import axios from 'axios';
import moment from 'moment';
export default {
  name: 'meetings',
  data() {
    return {
      startDate: moment().startOf('day'),
      endDate: moment().endOf('day'),
      loading: true,
      events: []
    };
  },
  created() {
    console.log('created');
  },
  mounted() {
    this.getEvents();
  },
  methods: {
    onChange(dateRange) {
      this.startDate = dateRange[0];
      this.endDate = dateRange[1];
      this.getEvents();
    },
    getEvents: function() {
      this.loading = true;

      const queryString = `from=${this.startDate}&to=${this.endDate}`;
      axios.get(`http://localhost:3000/events?${queryString}`).then(
        response => {
          this.loading = false;
          let { data } = response.data;
          data = data.map(row => {
            row.date = moment(row.startTime).format('D MMMM');
            row.hours =
              moment(row.startTime).format('h:mma') +
              ' - ' +
              moment(row.endTime).format('h:mma');
            return row;
          });
          this.events = data;
        },
        function(error) {
          console.log('error:', error.stack);
          this.loading = false;
        }
      );
    }
  }
};
</script>
