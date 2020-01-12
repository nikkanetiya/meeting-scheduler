<template>
  <div class="events">
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
  name: 'events',
  data() {
    return {
      loading: true,
      events: []
    };
  },
  created() {
    console.log('created');
    this.getEvents();
  },
  mounted() {},
  methods: {
    getEvents: function() {
      console.log(this.events);
      if (!this.events.length) {
        this.loading = true;
        axios.get('http://localhost:3000/events').then(
          response => {
            console.log(response.data);
            this.loading = false;
            let { data } = response.data;
            data = data.map(row => {
              row.date = moment(row.startTime).format('D MMMM');
              row.hours =
                moment(row.startTime).format('h:mma') +
                ' to ' +
                moment(row.endTime).format('h:mma');
              return row;
            });
            this.events = data;
            console.log(this.events);
          },
          function(error) {
            console.log('error:', error.stack);
            this.loading = false;
          }
        );
      }
    }
  }
};
</script>
