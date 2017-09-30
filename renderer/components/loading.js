export default () => (
  <div className='container'>
    <img src='../static/loading.gif' className='loader' />

    <style jsx>{`
      .container {
        height: 100%;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .loader {
        height: 100%;
        width: 100%;
      }

      img {
        max-width: 50px;
      }
    `}</style>
  </div>
)
