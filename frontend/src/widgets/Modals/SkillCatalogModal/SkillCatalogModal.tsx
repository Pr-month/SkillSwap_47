import { SkillCatalog } from '../../../entities/Skill/ui/SkillCatalog'
import { Modal } from '../../../shared/ui/Modal'
import styles from './SkillCatalogModal.module.css'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export const SkillCatalogModal = ({ isOpen, onClose }: Props) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className={styles.catalogDropdownOverlay}
      isDropdown={true}
    >
      <div className={styles.catalogWrapper}>
        <SkillCatalog />
      </div>
    </Modal>
  )
}
