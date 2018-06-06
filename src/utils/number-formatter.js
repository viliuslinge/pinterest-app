export default {

  formatMilisecondsToDate(time) {
    const month = new Date(time).getMonth();
    const year = new Date(time).getFullYear();
    const day = new Date(time).getDate();
    let hours = new Date(time).getHours();
    let minutes = new Date(time).getMinutes();
    const monthString = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
    minutes = String(minutes).length === 1 ? `0${String(minutes)}` : minutes;
    hours = String(hours).length === 1 ? `0${String(hours)}` : hours;
    const date = `${monthString[month]} ${day} ${year}, ${hours}:${minutes}`;
    return date;
  },

  formatTags(tags) {
    return tags.map((tag) => {
      return tag = `#${tag}`;
    })
  }
  
}