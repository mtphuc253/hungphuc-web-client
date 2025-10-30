import axiosClient from '@/lib/axiosClient'

export const uploadImage = async (file: File) => {
	const form = new FormData()
	form.append('file', file)

	const res = await axiosClient.post('/api/upload/image', form, {
		headers: { 'Content-Type': 'multipart/form-data' },
	})

	return res.data
}

const uploadService = { uploadImage }

export default uploadService

