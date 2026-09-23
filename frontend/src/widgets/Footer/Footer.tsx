import { Logo } from '../../shared/ui/Logo'
import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.colLeft}>
          <Logo />
          <p className={styles.copyright}>SkillSwap — 2025</p>
        </div>

        <div className={styles.rightSection}>
          <nav className={styles.col}>
            <ul className={styles.links}>
              <li>
                <Link to="" className={styles.link}>
                  О проекте
                </Link>
              </li>
              <li>
                <Link to="" className={styles.link}>
                  Все навыки
                </Link>
              </li>
            </ul>
          </nav>

          <nav className={styles.col}>
            <ul className={styles.links}>
              <li>
                <Link to="" className={styles.link}>
                  Контакты
                </Link>
              </li>
              <li>
                <Link to="" className={styles.link}>
                  Блог
                </Link>
              </li>
            </ul>
          </nav>

          <nav className={styles.col}>
            <ul className={styles.links}>
              <li>
                <Link to="" className={styles.link}>
                  Политика конфиденциальности
                </Link>
              </li>
              <li>
                <Link to="" className={styles.link}>
                  Пользовательское соглашение
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  )
}
