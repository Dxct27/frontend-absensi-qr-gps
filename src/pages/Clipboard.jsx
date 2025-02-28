const Clipboard = () => {
  const APP_URL = import.meta.env.VITE_FRONTEND_URL;
  return (
    <div className="">
      <h1>CLipboard</h1>
      {/* <a href="https://8cbd-103-107-117-14.ngrok-free.app"> */}
      <a href={`https://${APP_URL}`}>
        {" "}
        <span>Link</span>
      </a>
    </div>
  );
};

export default Clipboard;
