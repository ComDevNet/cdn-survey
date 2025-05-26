'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-white p-4 md:rounded-full shadow-lg container mx-auto md:mt-5">
      <div className="flex justify-between items-center">
        <div className="text-black text-xl font-bold md:ml-10 ml-4">
          <Link href="/">
            <Image src="/cdn-logo-transparent.webp" alt="Logo" width={60} height={60} />
          </Link>
        </div>
        <div className="md:hidden mr-5 mt-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-black focus:outline-none"
          >
            {isOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            )}
          </button>
        </div>
        <div className="hidden md:flex space-x-10 mr-14">
          <Link href="/create">
            <div className="text-black font-semibold text-lg hover:bg-gray-100 p-3 rounded-lg transition-all duration-500">Create</div>
          </Link>
          <Link href="/edit">
            <div className="text-black font-semibold text-lg hover:bg-gray-100 p-3 rounded-lg transition-all duration-500">Edit</div>
          </Link>
          <Link href="/view">
            <div className="text-black font-semibold text-lg hover:bg-gray-100 p-3 rounded-lg transition-all duration-500">View</div>
          </Link>
        </div>
      </div>
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="absolute top-0 left-0 w-full h-screen bg-white flex flex-col items-center justify-center space-y-10">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-black focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <Link href="/create">
              <div
                onClick={() => setIsOpen(false)}
                className="text-black text-2xl font-bold"
              >
                Create
              </div>
            </Link>
            <Link href="/edit">
              <div
                onClick={() => setIsOpen(false)}
                className="text-black text-2xl  font-bold"
              >
                Edit
              </div>
            </Link>
            <Link href="/view">
              <div
                onClick={() => setIsOpen(false)}
                className="text-black text-2xl font-bold"
              >
                View
              </div>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
