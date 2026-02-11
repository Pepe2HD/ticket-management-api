<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TicketAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_list_tickets(): void
    {
        $response = $this->getJson('/api/tickets');

        $response->assertStatus(401);
    }
}
