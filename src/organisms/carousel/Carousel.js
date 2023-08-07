import { Navigation, Pagination, Scrollbar, A11y, Autoplay  } from 'swiper/modules';

import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import { Box } from '../../atoms';
import { useAppContext } from '../../context/AppContext';

export const Carousel = (props) => {

    const { data = [], style = {}, heigth = 480, width = 'auto' } = props

    return (
        <Swiper
            modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay ]}
            loop
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
        >
            {data?.map((item, index) => (
                <SwiperSlide key={`${item}-${index}`} style={{ ...style}}>
                    <Box sx={{
                        backgroundSize: {xs: 'contain', xm: 'cover', md: 'cover', lg: 'cover'},
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        backgroundImage: `url('${item?.location}')`,
                        width: '100%',
                        height: heigth,
                        aspectRatio: '16/9',
                    }} />
                </SwiperSlide>
            ))}
        </Swiper>
    );
};