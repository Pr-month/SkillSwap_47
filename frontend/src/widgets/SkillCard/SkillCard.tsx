import React, { useRef } from 'react'
import styles from './SkillCard.module.css'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Swiper as SwiperType } from 'swiper'
import 'swiper/css'
import 'swiper/css/navigation'

interface SkillCardProps {
  title: string
  category: string
  description: string
  images: string[]
  children?: React.ReactNode
}

export const SkillCard: React.FC<SkillCardProps> = ({
  title,
  category,
  description,
  images,
  children,
}) => {
  const previewImages = images.slice(1, 4)
  const remaining = images.length - 3
  const swiperRef = useRef<SwiperType | null>(null)

  return (
    <div className={styles.card}>
      {/* Левая часть */}
      <div className={styles.info}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.category}>{category}</p>
        <p className={styles.description}>{description}</p>
        <div className={styles.actions}>{children}</div>
      </div>
      {/* Правая часть */}
      <div className={styles.images}>
        <div className={styles.sliderWrapper}>
          <Swiper onSwiper={(swiper) => (swiperRef.current = swiper)} className={styles.swiper}>
            {images.map((img, index) => (
              <SwiperSlide key={index}>
                <img src={img} alt={title} className={styles.mainImage} />
              </SwiperSlide>
            ))}
          </Swiper>
          <button className={styles.prev} onClick={() => swiperRef.current?.slidePrev()}>
            ‹
          </button>
          <button className={styles.next} onClick={() => swiperRef.current?.slideNext()}>
            ›
          </button>
        </div>
        {/* Миниатюры */}
        <div className={styles.preview}>
          {previewImages.map((img, index) => {
            if (index === 2 && remaining > 0) {
              return (
                <div key={index} className={styles.moreWrapper}>
                  <img src={img} className={styles.previewImage} />
                  <div className={styles.overlay}>+{remaining}</div>
                </div>
              )
            }
            return <img key={index} src={img} className={styles.previewImage} />
          })}
        </div>
      </div>
    </div>
  )
}
