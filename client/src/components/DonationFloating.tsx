import React from "react"
import DonationLauncher from "./DonationLauncher"
import type { DonationStatus } from "./DonationModal"

interface DonationFloatingProps {
    onStatus?: (status: DonationStatus | null) => void
}

const DonationFloating: React.FC<DonationFloatingProps> = ({
    onStatus
}) => (
    <div className="fixed bottom-5 right-4 z-40">
        <DonationLauncher
            className="shadow-xl"
            onStatus={onStatus}
        />
    </div>
)

export default DonationFloating
