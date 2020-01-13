<template>
  <div class="meetings">
    <!-- <a-date-picker @change="onChange" /> -->
    <a-range-picker @change="onChange" />
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
      loading: true,
      events: []
    };
  },
  created() {
    console.log('created');
  },
  methods: {
    onChange(date, dateRange) {
      console.log(date, dateRange);
      this.getEvents(dateRange);
    },
    getEvents: function(dateRange) {
      this.loading = true;
      const queryString = `from=${dateRange[0]}&to=${dateRange[1]}`;
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
