import { getBanners } from "@/services/bannerService"
import { getPartners } from "@/services/partnersService"
import BannerManagement from "./components/banner-management"
import PartnerManagement from "./components/partner-management"

export const revalidate = 0

const KhacPage = async () => {
  const [banners, partners] = await Promise.all([getBanners(), getPartners()])

  return (
    <div className="container mx-auto p-6 space-y-8">
      <BannerManagement banners={banners} />
      <PartnerManagement partners={partners} />
    </div>
  )
}

export default KhacPage
