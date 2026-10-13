import styles from './Logo.module.css'
import logo from '../../assets/logo.svg'
import { Link } from 'react-router-dom'

export const Logo = () => {
  return (
    <Link to="/" className={styles.logoContainer}>
      <img src={logo} alt="Logo" className={styles.logoImage} />
      <span className={styles.text}>SkillSwap</span>
    </Link>
  )
}
