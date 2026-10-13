import React from 'react'
import styles from './ErrorPage.module.css'
import { Button } from '../../shared/ui/Button/Button'
import { Link } from 'react-router-dom'

import errorImage_500 from '../../shared/assets/svg/error_500.svg'

const ServerErrorPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <img src={errorImage_500} alt="Ошибка 500" className={styles.image} />

        <h1 className={styles.title}>На сервере произошла ошибка</h1>

        <p className={styles.description}>Попробуйте позже или вернитесь на главную страницу</p>
        <div className={styles.actions}>
          <Button variant="secondary" className={styles.button}>
            Сообщить об ошибке
          </Button>

          <Link to="/">
            <Button className={styles.button}>На главную</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ServerErrorPage
