import moment from 'moment';

export const today = (f = 'MM/DD/YYYY h:mm A') => moment().format(f)

export const dateTimeFormat = (date, f = 'MM/DD/YYYY h:mm A') => date ? moment(date).format(f) : date

export const countdownTimer = (elementId, date_time, now_time) => {
  return $(function () {
    $(elementId).countdowntimer({
      startDate: now_time,
      dateAndTime: date_time,
      labelsFormat: true,
      displayFormat: "DHMS"
    });
  });
}

export const destroyCountdownTimer = (elementId) => {
  return new Promise((resolve, reject) => {
    $(function () {
      $(elementId).countdowntimer("destroy")
    })
    resolve();
  });
}
