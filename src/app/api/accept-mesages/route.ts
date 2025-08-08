import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { NextRequest, NextResponse } from "next/server";

// Type for the request body
interface AcceptMessagesRequest {
  acceptMessages: boolean;
}

// Type for authenticated user session
interface AuthenticatedUser {
  _id: string;
  email?: string;
  username?: string;
}

// Helper function to get authenticated user
async function getAuthenticatedUser(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return null;
  }

  const userId = (session.user as AuthenticatedUser)._id;
  if (!userId) {
    return null;
  }

  return { session, userId };
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Get authenticated user
    const authResult = await getAuthenticatedUser(request);
    if (!authResult) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated or user ID not found",
        },
        { status: 401 }
      );
    }

    const { userId } = authResult;

    // Parse and validate request body
    let body: AcceptMessagesRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON in request body",
        },
        { status: 400 }
      );
    }

    const { acceptMessages } = body;

    // Validate acceptMessages field
    if (typeof acceptMessages !== 'boolean') {
      return NextResponse.json(
        {
          success: false,
          message: "acceptMessages must be a boolean value",
        },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAcceptingMessage: acceptMessages },
      { new: true, select: 'isAcceptingMessage username email' }
    );

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found or failed to update",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Message acceptance status updated successfully",
        isAcceptingMessage: updatedUser.isAcceptingMessage,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error updating message acceptance:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get authenticated user
    const authResult = await getAuthenticatedUser(request);
    if (!authResult) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated or user ID not found",
        },
        { status: 401 }
      );
    }

    const { userId } = authResult;

    // Find user
    const foundUser = await UserModel.findById(userId).select("isAcceptingMessage");

    if (!foundUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        isAcceptingMessage: foundUser.isAcceptingMessage,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error fetching user message acceptance status:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}