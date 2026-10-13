import React from 'react'
import styles from './InformationBlock.module.css'
import { Button } from '../Button/Button'

import done from '../../assets/icons/done.png'
import notification from '../../assets/icons/notification2.png'

interface InformationBlockProps {
  variant: 'offer-created' | 'exchange-offered'
  onClick?: () => void
}

const informationData = {
  'offer-created': {
    title: 'Ваше предложение создано',
    description: 'Теперь вы можете предложить обмен',
    icon: done,
  },
  'exchange-offered': {
    title: 'Вы предложили обмен',
    description: 'Теперь дождитесь подтверждения. Вам придёт уведомление',
    icon: notification,
  },
}

export const InformationBlock: React.FC<InformationBlockProps> = ({ variant, onClick }) => {
  const data = informationData[variant]

  return (
    <div className={styles.container}>
      <img src={data.icon} alt="" className={styles.icon} />
      <h2 className={styles.title}>{data.title}</h2>
      <p className={styles.description}>{data.description}</p>
      <Button className={styles.button} onClick={onClick}>
        Готово
      </Button>
    </div>
  )
}
