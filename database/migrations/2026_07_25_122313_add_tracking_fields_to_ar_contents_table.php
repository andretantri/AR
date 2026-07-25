<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('ar_contents', function (Blueprint $table) {
            $table->string('tracking_mode')->default('disabled')->after('description');
            $table->string('mind_file_path')->nullable()->after('thumbnail_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ar_contents', function (Blueprint $table) {
            $table->dropColumn(['tracking_mode', 'mind_file_path']);
        });
    }
};
