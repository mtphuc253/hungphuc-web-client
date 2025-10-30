import CustomizationForm from "./components/customization-form"

const CustomizationPage = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Tùy Chỉnh</h1>
        <p className="text-muted-foreground">Quản lý thông tin và cài đặt công ty của bạn</p>
      </div>
      <CustomizationForm />
    </div>
  )
}

export default CustomizationPage
