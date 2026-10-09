export default function Icon({ name, ...props }) {
  const paths = {
    back: 'm14 6-6 6 6 6M8 12h12', arrow: 'M4 12h16m-6-6 6 6-6 6',
    video: 'M4 5h16v14H4zM9 5v14M15 5v14M4 9h5m-5 6h5m6-6h5m-5 6h5',
    upload: 'M12 16V4m-4 4 4-4 4 4M4 15v5h16v-5', code: 'm8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 16',
    copy: 'M8 8h12v12H8zM16 8V4H4v12h4', reset: 'M4 10a8 8 0 1 1 1 7M4 4v6h6',
    close: 'm6 6 12 12M6 18 18 6', sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42',
    moon: 'M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z',
  }
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d={paths[name] || paths.video}/></svg>
}
