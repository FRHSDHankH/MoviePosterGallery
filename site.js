const vue_app = Vue.createApp({
  // This automatically imports your movies.json file and puts it into
  //   the variable: movies
  created() {
    console.log('site.js created() called');
    fetch("movies.json")
      .then((response) => {
        if (!response.ok) throw new Error('Network response was not ok: ' + response.status);
        return response.json();
      })
      .then((json) => {
        this.movies = json;
        console.log('movies loaded', this.movies.length);
      })
      .catch((err) => {
        console.error('Failed to load movies.json:', err);
      });
  },
  data() {
    return {
      // This holds your movies.json data.
      movies: [],
      /* ADD ADDITIONAL VARIABLES FOR STEP 3 HERE */
      title: "IMDb + Hank's Top 10 Movies",
      owner: "Hank",
      github: "http://www.github.com/FRHSDHankH",
      // view mode: 'grid' or 'carousel'
      viewMode: 'grid',
      // index used by carousel
      carouselIndex: 0,
    };
  },
  methods: {
    /* ADD FUNCTIONS/METHODS FOR STEP 7 HERE */
    getMonthText(dateArray) {
      const month = dateArray[1];
      const day = dateArray[2];
      const year = dateArray[0];
      let monthText = "";
      switch (month) {
        case 1:
          monthText = "January";
          break;
        case 2:
          monthText = "February";
          break;
        case 3:
          monthText = "March";
          break;
        case 4:
          monthText = "April";
          break;
        case 5:
          monthText = "May";
          break;
        case 6:
          monthText = "June";
          break;
        case 7:
          monthText = "July";
          break;
        case 8:
          monthText = "August";
          break;
        case 9:
          monthText = "September";
          break;
        case 10:
          monthText = "October";
          break;
        case 11:
          monthText = "November";
          break;
        case 12:
          monthText = "December";
          break;
        default:
          monthText = "";
      }
      return `${monthText} ${day}, ${year}`;
    },
    like(index) {
      this.movies[index].likes++;
    },
    dislike(index) {
      this.movies[index].dislikes++;
    },
    posterClick(index) {
      const postersLength = this.movies[index].posters.length;
      this.movies[index].posterindex = (this.movies[index].posterindex + 1) % postersLength;
    },
    timeText(minutes) {
      const hours = Math.trunc(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    },
    // carousel controls
    nextMovie() {
      if (!this.movies || this.movies.length === 0) return;
      this.carouselIndex = (this.carouselIndex + 1) % this.movies.length;
    },
    prevMovie() {
      if (!this.movies || this.movies.length === 0) return;
      this.carouselIndex = (this.carouselIndex - 1 + this.movies.length) % this.movies.length;
    },
    selectMovie(i) {
      if (!this.movies || i < 0 || i >= this.movies.length) return;
      this.carouselIndex = i;
    }
  },
});

vue_app.mount("#vue_app");
console.log('vue_app mounted');
