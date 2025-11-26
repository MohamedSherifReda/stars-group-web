import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@ui/common/button';
import { Card } from '@ui/common/card';
import { Input } from '@ui/common/input';
import { Label } from '@ui/common/label';
import { Separator } from '@ui/common/separator';
import { Textarea } from '@ui/common/textarea';
import React from 'react'
import { useForm } from 'react-hook-form'
import { isValidPhoneNumber } from 'react-phone-number-input';
import * as z from 'zod'


const feedbackSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.email({ message: "Invalid email address" }),
  message: z.string().min(1, { message: "Message is required" }),
  phone_number: z.string().refine((value) => isValidPhoneNumber(value ?? ""), { message: "Invalid phone number" }),
})

type FeedbackFormData = z.infer<typeof feedbackSchema>;

const UserFeedback = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
      phone_number: "",
    }
  })
  const onSubmit = (data: FeedbackFormData) => {
    console.log("form data",data)
  }
  return (
    <section className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <div className="p-8 md:p-10">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              We Value Your Feedback
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
              Share your thoughts, suggestions, or concerns with us. We're here
              to listen.
            </p>
          </div>

          <Separator className="mb-8" />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter your full name"
                className={`transition-all duration-200 ${
                  errors.name ? 'border-red-500 focus:ring-red-500' : ''
                }`}
              />
              {errors.name && (
                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="you@example.com"
                className={`transition-all duration-200 ${
                  errors.email ? 'border-red-500 focus:ring-red-500' : ''
                }`}
              />
              {errors.email && (
                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone Number Field */}
            <div className="space-y-2">
              <Label
                htmlFor="phone_number"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone_number"
                {...register('phone_number')}
                placeholder="+1 (555) 000-0000"
                className={`transition-all duration-200 ${
                  errors.phone_number ? 'border-red-500 focus:ring-red-500' : ''
                }`}
              />
              {errors.phone_number && (
                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.phone_number.message}
                </p>
              )}
            </div>

            {/* Message Field */}
            <div className="space-y-2">
              <Label
                htmlFor="message"
                className="text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                Your Message <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="message"
                {...register('message')}
                placeholder="Tell us what's on your mind..."
                rows={5}
                className={`${
                  errors.message ? 'border-red-500 focus:ring-red-500' : ''
                }`}
              />
              {errors.message && (
                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.message.message}
                </p>
              )}
            </div>

            <Separator className="my-6" />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
              <Button
                type="submit"
                className="flex-1 h-11 font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <svg
                  className="w-5 h-5 mr-2 rotate-90"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                Submit Feedback
              </Button>
              <Button
                type="button"
                onClick={() => reset()}
                variant="outline"
                className="flex-1 h-11 font-semibold text-base border-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Clear Form
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </section>
  );
}

export default UserFeedback