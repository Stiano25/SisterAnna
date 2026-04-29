import React from "react"
import DonationLauncher from "./DonationLauncher"

const DonationFloating: React.FC = () => (
    <div className="fixed bottom-5 right-4 z-40">
        <DonationLauncher className="shadow-xl" />
    </div>
)

export default DonationFloating
