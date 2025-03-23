import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { interests } = body;
    
    if (!interests || !Array.isArray(interests) || interests.length === 0) {
      return NextResponse.json(
        { error: 'Invalid interests data' },
        { status: 400 }
      );
    }
    
    // Here you would typically:
    // 1. Validate the data
    // 2. Store it in a database
    // 3. Send it to an external API
    // 4. Process it for podcast generation
    
    console.log('Received interests:', interests);
    
    // For now, we'll just simulate a successful submission
    // In a real app, you would integrate with your backend services
    
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return NextResponse.json({ 
      success: true,
      message: 'Interests submitted successfully',
      interestsCount: interests.length
    });
    
  } catch (error) {
    console.error('Error processing interests submission:', error);
    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500 }
    );
  }
}
