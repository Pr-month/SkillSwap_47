import { useEffect, useMemo } from 'react'
import editRightIcon from '../../../shared/assets/icons/edit-right.svg'
import { Button } from '../../../shared/ui/Button'
import { Modal } from '../../../shared/ui/Modal'
import { SkillCard } from '../../SkillCard'
import styles from './RegistrationPreviewModal.module.css'
interface Props {
  isOpen: boolean
  isSubmitting?: boolean
  onClose: () => void
  onComplete: () => void | Promise<void>
  title: string
  category: string
  description: string
  images: Array<string>
}

export const RegistrationPreviewModal = ({
  isOpen,
  isSubmitting = false,
  onClose,
  onComplete,
  title,
  category,
  description,
  images,
}: Props) => {
  const fallbackImage = '/images/skills/sk1-1.png'

  const preparedImages = useMemo(() => {
    const objectUrlsToRevoke: string[] = []
    const prepared = images.map((image) => {
      if (typeof image === 'string') return image

      const objectUrl = URL.createObjectURL(image)
      objectUrlsToRevoke.push(objectUrl)
      return objectUrl
    })

    return {
      urls: prepared.length > 0 ? prepared : [fallbackImage],
      objectUrlsToRevoke,
    }
  }, [images])

  useEffect(() => {
    return () => {
      preparedImages.objectUrlsToRevoke.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [preparedImages])

  const handleEditClick = () => {
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className={styles.overlay}>
      <div className={styles.container}>
        <h2 className={styles.title}>Ваше предложение</h2>
        <p className={styles.subtitle}>Пожалуйста, проверьте и подтвердите правильность данных</p>

        <div className={styles.cardWrapper}>
          <SkillCard
            title={title}
            category={category}
            description={description}
            images={preparedImages.urls}
          >
            <Button
              variant="secondary"
              className={`${styles.actionButton} ${styles.editButton}`}
              onClick={handleEditClick}
            >
              Редактировать
              <img src={editRightIcon} alt="" aria-hidden className={styles.editIcon} />
            </Button>
            <Button className={styles.actionButton} onClick={onComplete} disabled={isSubmitting}>
              {isSubmitting ? 'Отправка...' : 'Готово'}
            </Button>
          </SkillCard>
        </div>
      </div>
    </Modal>
  )
}
