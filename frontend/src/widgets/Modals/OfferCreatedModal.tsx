import { InformationBlock } from '../../shared/ui/InformationBlock'
import { Modal } from '../../shared/ui/Modal'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export const OfferCreatedModal = ({ isOpen, onClose }: Props) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <InformationBlock variant="offer-created" onClick={onClose}></InformationBlock>
    </Modal>
  )
}
