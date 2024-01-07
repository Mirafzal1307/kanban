module.exports = {
  content: ['./**/*.html'],
  darkMode: ['class', '[theme-data="dark"]'],
  theme: {
    extend: {
      colors: {
        'page-color': 'var(--bg-page-color)',
        'content-color': 'var(--bg-content-color)',
        'lines-color': 'var(--lines-color)',
        'primary-color': 'var(--primary-color)',
        'primary-light-color': 'var(--primary-light-color)',
        'primary-disabled-color': 'var(--primary-disabled-color)',
        'gray-color': 'var(--gray-color)',
        'danger-color': 'var(--danger-color)',
        'danger-light-color': 'var(--danger-light-color)',
        'input-color': 'var(--input-border)',
        'btn-light-color': 'var(--btn-light-color)',
        'btn-hover-color': 'var(--btn-hover-color)',
        color: 'var(--text-color)', // assuming 'color' is meant to be a generic text color
      },
      width: {
        280: '280px',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(180deg, var(--gradient-f) 0%, var(--gradient-t) 100%)',
      },
    },
  },
  plugins: [],
}
