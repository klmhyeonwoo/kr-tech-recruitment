"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import greeting_image_eyes from "../../../public/images/eyes.gif";
import greeting_image_waving from "../../../public/images/waving.gif";
import greeting_image_rocket from "../../../public/images/rocket.gif";
import greeting_image_popper from "../../../public/images/popper.gif";
import greeting_image_earth from "../../../public/images/earth.png";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "@/styles/swiper.scss";
import GreetingCard from "../common/greeting-card";

function GreetingSwiper() {
  return (
    <Swiper
      spaceBetween={170}
      slidesPerView={2.5}
      loop={true}
      speed={2500}
      autoplay={{ delay: 2000, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      modules={[Autoplay, Pagination, Navigation]}
      breakpoints={{
        480: {
          slidesPerView: 1.8,
          spaceBetween: 30,
          centeredSlides: true,
        },
        768: {
          slidesPerView: 2.5,
          spaceBetween: -50,
        },
        // 데스크톱 (1024px 이상)
        1024: {
          slidesPerView: 3.5,
          spaceBetween: -170,
        },
      }}
    >
      <SwiperSlide>
        <GreetingCard
          title="빅테크 공고 모아보기"
          subTitle="빅테크 채용관"
          description="네카라쿠배당토 · 몰두센 · 게임사 등 국내 빅테크 기업들의 채용 공고를 한 눈에 확인해보세요"
          navigate="web"
          colorSet={["#43cbff", "#9708cc"]}
          image={greeting_image_eyes}
        />
      </SwiperSlide>
      <SwiperSlide>
        <GreetingCard
          title="이용에 불편함이 있으신가요?"
          subTitle="서비스 문의하기"
          description="서비스 이용 중 불편함이나 필요한 기능이 있다면 언제든지 문의해 주세요."
          navigate="channel-talk"
          colorSet={["#141E30", "#243B55"]}
          image={greeting_image_waving}
        />
      </SwiperSlide>
      <SwiperSlide>
        <GreetingCard
          title="취업 및 이직 커뮤니티"
          subTitle="커뮤니티 참여하기"
          description="커뮤니티를 통해 여러분들의 생각과 다른 사람들과 이야기하며 다양한 의견을 나누어보세요."
          navigate="not-yet"
          colorSet={["#1E40AF", "#3B82F6"]}
          image={greeting_image_earth}
        />
      </SwiperSlide>
      <SwiperSlide>
        <GreetingCard
          title="더 많은 기능들이 다가오고 있어요"
          subTitle="로켓처럼 빠르게 발전하고 있어요"
          navigate="release-notes"
          description="더 다양한 정보를 위해 지속적으로 발전하고 있으며, 더 많은 기능들이 곧 추가될 예정이에요."
          colorSet={["#FF512F", "#DD2476"]}
          image={greeting_image_rocket}
        />
      </SwiperSlide>
      <SwiperSlide>
        <GreetingCard
          title="취준 · 이직 5초만에 고민 해결하기"
          subTitle="이번 주 질문이 도착했어요"
          navigate="/question"
          description="이번 주 질문을 통해 여러분의 생각을 익명으로 나눠보세요. 다른 사람들의 의견도 확인할 수 있어요."
          colorSet={["#667eea", "#764ba2"]}
          image={greeting_image_popper}
        />
      </SwiperSlide>
    </Swiper>
  );
}

export default GreetingSwiper;
