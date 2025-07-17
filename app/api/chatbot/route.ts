import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json()

    console.log("Chatbot submission:", { type, data })

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    let emailContent = ""
    let subject = ""

    switch (type) {
      case "query":
        subject = "New Query from Chatbot"
        emailContent = `
          <h2>New Query Submission</h2>
          <p><strong>Query:</strong> ${data.query}</p>
        `
        break
      case "contact":
        subject = `New Contact from ${data.name}`
        emailContent = `
          <h2>New Contact Submission</h2>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Message:</strong></p>
          <p>${data.contactMessage}</p>
        `
        break
      case "feedback":
        subject = "New Feedback Submission"
        emailContent = `
          <h2>New Feedback Submission</h2>
          <p><strong>Rating:</strong> ${data.rating}/5 stars</p>
          <p><strong>Feedback:</strong></p>
          <p>${data.feedbackMessage}</p>
        `
        break
    }

    // In a real implementation, you would send an email to contact@opulencebyte.com
    // Example with a hypothetical email service:
    /*
    await emailService.send({
      to: "contact@opulencebyte.com",
      subject: subject,
      html: emailContent,
    })
    */

    return NextResponse.json({ success: true, message: "Message sent successfully" })
  } catch (error) {
    console.error("Error sending chatbot message:", error)
    return NextResponse.json({ success: false, message: "Failed to send message" }, { status: 500 })
  }
}
