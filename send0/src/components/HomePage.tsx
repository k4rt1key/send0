import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSharedContent, uploadFiles } from '@/lib/api'
import { ServerResponse, UploadData } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileIcon, FileText, Image, Archive, Download } from 'lucide-react'

export default function ImprovedSend0Dark() {
  const { name } = useParams<{ name?: string }>()
  const [nameInput, setNameInput] = useState(name || '')
  const [password, setPassword] = useState('')
  const [isPasscode, setIsPasscode] = useState(false)
  const [content, setContent] = useState<UploadData | null>(null)
  const [text, setText] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [expiryTime, setExpiryTime] = useState('24')
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  const fetchContent = async (password?: string) => {
    if (name) {
      const res = await getSharedContent(name, password)
      if (res.success) {
        setContent(res.data as UploadData)
      } else {
        if (res.statusCode === 401) {
          setIsPasswordDialogOpen(true)
        } else {
          setContent(null)
          if (res.statusCode === 404) {
            toast({
              title: 'Content Not Found',
              description: `No content found for "${name}". You can share content using this name.`,
              variant: 'default',
            })
          } else {
            toast({
              title: 'Error',
              description: res.message,
              variant: 'destructive',
            })
          }
        }
      }
    }
  }

  useEffect(() => {
    fetchContent()
  }, [name])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/${nameInput}`)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await uploadFiles({
        name: nameInput,
        text,
        password,
        hasPassword: isPasscode,
        files,
        expiryTime: parseInt(expiryTime)
      })
      if (response.success) {
        toast({
          title: 'Success',
          description: 'Content uploaded successfully',
        })
        setContent(response.data as UploadData)
      } else {
        toast({
          title: 'Error',
          description: response.message,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    }
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchContent(password)
    setIsPasswordDialogOpen(false)
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf':
        return <FileText className="w-6 h-6 text-red-500" />
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return <Image className="w-6 h-6 text-green-500" />
      case 'zip':
      case 'rar':
        return <Archive className="w-6 h-6 text-yellow-500" />
      default:
        return <FileIcon className="w-6 h-6 text-blue-500" />
    }
  }

  const handleDownloadAll = () => {
    content?.files.forEach(file => {
      window.open(file.presignedUrl, '_blank')
    })
  }

  return (
    <div className="font-2 w-full flex justify-center items-center py-8 px-4">
      <div className="w-full max-w-md bg-gray-900/80 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden text-gray-100">
        <div className="p-6">
          <h1 className="text-3xl font-1 mb-6 text-center text-purple-300">Send0 - The Internet Clipboard</h1>
          
          <form onSubmit={handleSubmit} className="flex items-center space-x-2 mb-6">
            <Label htmlFor="name" className="whitespace-nowrap text-md">send0.net/</Label>
            <Input
              id="name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Enter a name"
              className="flex-grow text-sm bg-gray-800 border-gray-700 text-gray-100"
            />
            <Button type="submit" size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">Go</Button>
          </form>

          {content ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-1 text-center text-purple-300">Shared Content</h2>
              {content.text && (
                <Textarea
                  value={content.text}
                  readOnly
                  className="w-full h-40 text-sm bg-gray-800 border-gray-700 text-gray-100"
                />
              )}
              {content.files && content.files.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-purple-300">Files</h3>
                    <Button
                      onClick={handleDownloadAll}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Download All
                    </Button>
                  </div>
                  <ul className="space-y-2">
                    {content.files.map((file, index) => (
                      <li key={index} className="flex items-center justify-between text-sm bg-gray-800 p-2 rounded">
                        <div className="flex items-center space-x-2">
                          {getFileIcon(file.name)}
                          <span className="truncate">{file.name}</span>
                        </div>
                        <Button
                          asChild
                          size="sm"
                          variant="ghost"
                          className="text-purple-300 hover:text-purple-100 hover:bg-purple-800"
                        >
                          <a href={file.presignedUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4" />
                          </a>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleUpload} className="space-y-4">
              <h2 className="text-2xl font-1 text-center text-purple-300">Create New Content</h2>
              <div className="space-y-2">
                <Label htmlFor="text" className="text-sm font-medium text-gray-300">Text</Label>
                <Textarea
                  id="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste in anything you want."
                  className="w-full h-40 text-sm bg-gray-800 border-gray-700 text-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="files" className="text-sm font-medium text-gray-300">Files</Label>
                <Input
                  id="files"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="text-sm bg-gray-800 border-gray-700 text-gray-100"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPasscode"
                  checked={isPasscode}
                  onCheckedChange={(checked) => setIsPasscode(checked as boolean)}
                />
                <Label htmlFor="isPasscode" className="text-sm font-medium text-gray-300">Protect with passcode</Label>
              </div>
              {isPasscode && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-300">Passcode</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-sm bg-gray-800 border-gray-700 text-gray-100"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="expiryTime" className="text-sm font-medium text-gray-300">Expiry Time</Label>
                <Select value={expiryTime} onValueChange={setExpiryTime}>
                  <SelectTrigger className="w-full text-sm bg-gray-800 border-gray-700 text-gray-100">
                    <SelectValue placeholder="Select expiry time" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-gray-100">
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="2">2 hours</SelectItem>
                    <SelectItem value="4">4 hours</SelectItem>
                    <SelectItem value="6">6 hours</SelectItem>
                    <SelectItem value="12">12 hours</SelectItem>
                    <SelectItem value="24">24 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white">Create Clip</Button>
            </form>
          )}
        </div>
      </div>

      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-gray-900 text-gray-100">
          <DialogHeader>
            <DialogTitle className="text-purple-300">Password Required</DialogTitle>
            <DialogDescription className="text-gray-400">
              This content is password protected. Please enter the password to view it.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="passwordInput" className="text-sm font-medium text-gray-300">Password</Label>
                <Input
                  id="passwordInput"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-sm bg-gray-800 border-gray-700 text-gray-100"
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">Submit</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}