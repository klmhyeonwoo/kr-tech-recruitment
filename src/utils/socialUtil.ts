const handleKakaoSocialLogin = () => {
  window.Kakao.Auth.authorize({
    redirectUri: `${window.document.location.origin}/auth`,
  });
};

const checkInitializedKakaoSDK = () => {
  if (!window.Kakao?.isInitialized()) {
    window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY);
  }
};

export { handleKakaoSocialLogin, checkInitializedKakaoSDK };
