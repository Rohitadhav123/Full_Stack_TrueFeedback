import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  await dbConnect();

  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Not Authenticated",
      },
      { status: 401 }
    );
  }

  // Assuming you've added _id to your session user via a custom callback
  const userId = (session.user as any)._id;

  if (!userId) {
    return Response.json(
      {
        success: false,
        message: "User ID not found in session",
      },
      { status: 400 }
    );
  }

  const { acceptMessages } = await request.json();

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        isAcceptingMessage: acceptMessages,
      },
      {
        new: true,
      }
    );

    if (!updatedUser) {
      return Response.json(
        {
          success: false,
          message: "Failed to update user status to accept messages",
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Message acceptance updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating message acceptance:", error);
    return Response.json(
      {
        success: false,
        message: "Something went wrong while updating status",
      },
      { status: 500 }
    );
  }
}
