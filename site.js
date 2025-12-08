const vue_app = Vue.createApp({
  // This automatically imports your movies.json file and puts it into
  //   the variable: movies
  created() {
    console.log('site.js created() called');
    // Load persisted settings early so UI reflects them while data loads
    try {
      const savedTheme = localStorage.getItem('mpg_theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        this.theme = savedTheme;
      } else {
        // default to dark if nothing saved
        this.theme = 'dark';
        try { localStorage.setItem('mpg_theme', 'dark'); } catch (e) {}
      }
      const savedView = localStorage.getItem('mpg_viewMode');
      if (savedView === 'grid' || savedView === 'carousel') this.viewMode = savedView;
      const savedIndex = parseInt(localStorage.getItem('mpg_carouselIndex'), 10);
      if (!Number.isNaN(savedIndex) && savedIndex >= 0) this.carouselIndex = savedIndex;
    } catch (e) {
      console.warn('localStorage not available:', e);
    }
    fetch("movies.json")
      .then((response) => {
        if (!response.ok) throw new Error('Network response was not ok: ' + response.status);
        return response.json();
      })
      .then((json) => {
        this.movies = json;
        console.log('movies loaded', this.movies.length);
        // ensure carouselIndex is within bounds after loading
        if (this.carouselIndex >= this.movies.length) this.carouselIndex = Math.max(0, this.movies.length - 1);
        // load persisted likes/dislikes (reactions) if present
        try { this.loadReactions(); } catch (e) { console.warn('loadReactions failed', e); }
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
      // theme: 'dark' or 'light'
      theme: 'dark',
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
      const m = this.movies && this.movies[index];
      if (!m) return;
      if (typeof m.likes !== 'number') m.likes = 0;
      m.likes++;
      try { this.saveReactions(); } catch (e) { console.warn('saveReactions failed', e); }
    },
    dislike(index) {
      const m = this.movies && this.movies[index];
      if (!m) return;
      if (typeof m.dislikes !== 'number') m.dislikes = 0;
      m.dislikes++;
      try { this.saveReactions(); } catch (e) { console.warn('saveReactions failed', e); }
    },
    posterClick(index) {
      const m = this.movies && this.movies[index];
      if (!m || !Array.isArray(m.posters) || m.posters.length === 0) return;
      if (typeof m.posterindex !== 'number') m.posterindex = 0;
      const postersLength = m.posters.length;
      m.posterindex = (m.posterindex + 1) % postersLength;
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
      try { localStorage.setItem('mpg_carouselIndex', String(this.carouselIndex)); } catch (e) {}
    },
    prevMovie() {
      if (!this.movies || this.movies.length === 0) return;
      this.carouselIndex = (this.carouselIndex - 1 + this.movies.length) % this.movies.length;
      try { localStorage.setItem('mpg_carouselIndex', String(this.carouselIndex)); } catch (e) {}
    },
    selectMovie(i) {
      if (!this.movies || i < 0 || i >= this.movies.length) return;
      this.carouselIndex = i;
      try { localStorage.setItem('mpg_carouselIndex', String(this.carouselIndex)); } catch (e) {}
    }
    ,
    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark';
      console.log('toggleTheme ->', this.theme);
      try { localStorage.setItem('mpg_theme', this.theme); } catch (e) {}
    }
    ,
    // Persist and restore per-movie likes/dislikes
    saveReactions() {
      try {
        const map = {};
        (this.movies || []).forEach((m) => {
          if (m && typeof m.title === 'string') {
            map[m.title] = { likes: Number(m.likes) || 0, dislikes: Number(m.dislikes) || 0 };
          }
        });
        localStorage.setItem('mpg_reactions', JSON.stringify(map));
      } catch (e) {
        console.warn('saveReactions error', e);
      }
    },
    loadReactions() {
      try {
        const raw = localStorage.getItem('mpg_reactions');
        if (!raw) return;
        const map = JSON.parse(raw);
        if (!map || typeof map !== 'object') return;
        (this.movies || []).forEach((m) => {
          if (m && typeof m.title === 'string' && map[m.title]) {
            m.likes = Number(map[m.title].likes) || 0;
            m.dislikes = Number(map[m.title].dislikes) || 0;
          }
        });
      } catch (e) {
        console.warn('loadReactions error', e);
      }
    }
    ,
    // keyboard handler used for carousel navigation
    handleKeydown(e) {
      if (this.viewMode !== 'carousel') return;
      if (!this.movies || this.movies.length === 0) return;
      const key = e.key;
      if (key === 'ArrowLeft') {
        e.preventDefault();
        this.prevMovie();
      } else if (key === 'ArrowRight') {
        e.preventDefault();
        this.nextMovie();
      } else if (key === ' ' || key === 'Enter') {
        // space or enter cycles the poster for current movie
        e.preventDefault();
        this.posterClick(this.carouselIndex);
      } else if (key === 'Home') {
        e.preventDefault();
        this.selectMovie(0);
      } else if (key === 'End') {
        e.preventDefault();
        this.selectMovie(this.movies.length - 1);
      }
    }
  },
  // lifecycle hooks and watchers
  mounted() {
    // register keyboard handler
    window.addEventListener('keydown', this.handleKeydown);
    console.log('site.js mounted() - keyboard handler registered');
    // log initial theme and element classes
    console.log('initial theme:', this.theme);
    const el = document.getElementById('vue_app');
    if (el) console.log('#vue_app initial classes:', el.className);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeydown);
    console.log('site.js beforeUnmount() - keyboard handler removed');
  },
  watch: {
    viewMode(newVal) {
      try { localStorage.setItem('mpg_viewMode', newVal); } catch (e) {}
    }
    ,
    theme(newVal) {
      console.log('theme watcher ->', newVal);
      // ensure the root element has the theme class explicitly in case binding fails
      try {
        const root = document.getElementById('vue_app');
        if (root) {
          root.classList.remove('light', 'dark');
          root.classList.add(newVal);
          console.log('#vue_app classes set to:', root.className);
        }
        localStorage.setItem('mpg_theme', newVal);
      } catch (e) {
        console.warn('Failed to apply theme to root element or save to localStorage', e);
      }
    }
  },
});

vue_app.mount("#vue_app");
console.log('vue_app mounted');
