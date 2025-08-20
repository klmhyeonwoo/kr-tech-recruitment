const handleKakaoSocialLogin = () => {
  window.Kakao.Auth.authorize({
    redirectUri: "http://localhost:3000/auth",
  });
};

const checkInitializedKakaoSDK = () => {
  if (!window.Kakao?.isInitialized()) {
    window.Kakao.init(process.env.NEXT_KAKAO_JAVASCRIPT_KEY);
  }
};

export { handleKakaoSocialLogin, checkInitializedKakaoSDK };
